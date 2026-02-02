/**
 * Data Migration Script for Tutoring Database
 *
 * Migrates data from Google Sheets CSV exports to Supabase
 * Customized for hours-based tutoring system with package tracking
 *
 * Prerequisites:
 * - Node.js installed
 * - Run: npm install @supabase/supabase-js csv-parser
 * - Place CSV exports in database/exports/ folder
 * - Update SUPABASE_URL and SUPABASE_SERVICE_KEY below
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR-SERVICE-ROLE-KEY-HERE'; // DO NOT COMMIT THIS!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// CSV File Paths
// ============================================================================

const CSV_DIR = path.join(__dirname, 'exports');
const FILES = {
    clients: path.join(CSV_DIR, 'clients.csv'),
    payments: path.join(CSV_DIR, 'payments.csv'),
    lessons: path.join(CSV_DIR, 'lessons.csv')
};

// ============================================================================
// Utility Functions
// ============================================================================

function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

async function clearTable(tableName) {
    console.log(`Clearing ${tableName} table...`);
    const { error } = await supabase.from(tableName).delete().neq('id', 0);
    if (error) {
        console.error(`Error clearing ${tableName}:`, error);
        throw error;
    }
}

function parseDate(dateString) {
    if (!dateString) return null;
    // Handle various date formats: "2020/06/10 0:00", "4/23/2020", etc.
    const cleaned = dateString.split(' ')[0]; // Remove time if present
    const parts = cleaned.split('/');
    if (parts.length === 3) {
        // Check if year is first (YYYY/MM/DD) or last (MM/DD/YYYY or DD/MM/YYYY)
        if (parts[0].length === 4) {
            // YYYY/MM/DD format
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
            // MM/DD/YYYY format (most common in North America)
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
            return `${year}-${month}-${day}`;
        }
    }
    return cleaned;
}

// ============================================================================
// Migration Functions
// ============================================================================

async function migrateClients() {
    console.log('\n📋 Migrating Clients...');

    const clientsData = await readCSV(FILES.clients);
    console.log(`Found ${clientsData.length} clients`);

    // Transform CSV data to match database schema
    // Google Sheets columns: UID, full name, status, email, telephone, Lead Source, Teacher
    const clients = clientsData.map(row => ({
        uid: (row.UID || row.uid || '').toUpperCase(),
        full_name: row['full name'] || row.full_name || row.name || '',
        status: (row.status || row.Status || 'active').toLowerCase(),
        email: row.email || row.Email || null,
        telephone: row.telephone || row.Telephone || row.phone || row.Phone || null,
        lead_source: row['Lead Source'] || row.lead_source || null,
        teacher: row.Teacher || row.teacher || 'Rahul',
        notes: row.notes || row.Notes || null
    })).filter(c => c.uid && c.full_name); // Only include rows with UID and name

    if (clients.length === 0) {
        console.log('⚠️  No valid client data found');
        return;
    }

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < clients.length; i += batchSize) {
        const batch = clients.slice(i, i + batchSize);
        const { error } = await supabase.from('clients').insert(batch);

        if (error) {
            console.error('Error inserting clients batch:', error);
            throw error;
        }
        console.log(`Inserted ${Math.min(i + batch.length, clients.length)}/${clients.length} clients`);
    }

    console.log('✅ Clients migrated successfully');
}

async function migratePayments() {
    console.log('\n💰 Migrating Payments...');

    // First, get all clients to create a UID-to-ID mapping
    const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, uid');

    if (clientError) throw clientError;

    const clientMap = {};
    clients.forEach(client => {
        clientMap[client.uid.toUpperCase()] = client.id;
    });

    const paymentsData = await readCSV(FILES.payments);
    console.log(`Found ${paymentsData.length} payments`);

    // Transform CSV data
    // Google Sheets columns: UID, Full Name, Date, package, # of hours, amount paid,
    // hourly rate, amount owing, apply tax, hst, total payment, status, payment method, year
    const payments = paymentsData
        .map(row => {
            const uid = (row.UID || row.uid || '').toUpperCase();
            const clientId = clientMap[uid];

            if (!clientId) {
                console.warn(`⚠️  Client not found for payment (UID: ${uid})`);
                return null;
            }

            return {
                client_id: clientId,
                payment_date: parseDate(row['Date (a/receivable)'] || row.Date || row.date),
                package_type: row['package (payments)'] || row.package || row.package_type || null,
                hours_purchased: parseFloat(row['# of hours (payments)'] || row.hours || row.hours_purchased || 0),
                amount_paid: parseFloat(row['amount paid (payments)'] || row.amount_paid || row.amount || 0) || null,
                hourly_rate: parseFloat(row['hourly rate'] || row.hourly_rate || 0) || null,
                amount_owing_pretax: parseFloat(row['amount owing (pretax)'] || row.amount_owing || 0) || null,
                apply_tax: (row['apply tax (payments)'] || row.apply_tax || 'no').toLowerCase() === 'yes',
                hst_amount: parseFloat(row['hst (P)'] || row.hst || 0) || 0,
                total_payment: parseFloat(row['total payment (p)'] || row.total_payment || row.total || 0) || null,
                status: (row['status (p)'] || row.status || 'paid').toLowerCase(),
                payment_method: (row['payment method (p)'] || row.payment_method || '').toLowerCase() || null,
                year: parseInt(row['year (p)'] || row.year || new Date().getFullYear()),
                notes: row.notes || row.Notes || null
            };
        })
        .filter(p => p !== null); // Remove payments with missing clients

    if (payments.length === 0) {
        console.log('⚠️  No valid payment data found');
        return;
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < payments.length; i += batchSize) {
        const batch = payments.slice(i, i + batchSize);
        const { error } = await supabase.from('payments').insert(batch);

        if (error) {
            console.error('Error inserting payments batch:', error);
            throw error;
        }
        console.log(`Inserted ${Math.min(i + batch.length, payments.length)}/${payments.length} payments`);
    }

    console.log('✅ Payments migrated successfully');
}

async function migrateLessons() {
    console.log('\n📚 Migrating Lessons...');

    // Get all clients for UID-to-ID mapping
    const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, uid');

    if (clientError) throw clientError;

    const clientMap = {};
    clients.forEach(client => {
        clientMap[client.uid.toUpperCase()] = client.id;
    });

    const lessonsData = await readCSV(FILES.lessons);
    console.log(`Found ${lessonsData.length} lessons`);

    // Transform CSV data
    // Google Sheets columns: UID, student name, date of lesson, # of hours taught,
    // paid teacher, paid or probono, teacher, Description of Lesson
    const lessons = lessonsData
        .map(row => {
            const uid = (row.UID || row.uid || '').toUpperCase();
            const clientId = clientMap[uid];

            if (!clientId) {
                console.warn(`⚠️  Client not found for lesson (UID: ${uid})`);
                return null;
            }

            // Extract topic from description or use placeholder
            let topic = 'General';
            const description = row['Description of Lesson'] || row.description || row.notes || '';
            const commentMatch = description.match(/comments \(m\):\s*([^\n]+)/i);
            if (commentMatch) {
                topic = commentMatch[1].trim();
            }

            return {
                client_id: clientId,
                lesson_date: parseDate(row['date of lesson'] || row.Date || row.date),
                hours_taught: parseFloat(row['# of hours taught'] || row.hours_taught || row.hours || 1),
                teacher: row['teacher (lesson) drop'] || row.teacher || row.Teacher || 'Rahul',
                lesson_topic: topic,
                paid_or_probono: (row['paid or probono'] || row.paid_or_probono || 'paid').toLowerCase(),
                paid_teacher: parseDate(row['paid teacher (lesson)'] || row.paid_teacher) || null,
                notes: description || null
            };
        })
        .filter(l => l !== null);

    if (lessons.length === 0) {
        console.log('⚠️  No valid lesson data found');
        return;
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < lessons.length; i += batchSize) {
        const batch = lessons.slice(i, i + batchSize);
        const { error } = await supabase.from('lessons').insert(batch);

        if (error) {
            console.error('Error inserting lessons batch:', error);
            throw error;
        }
        console.log(`Inserted ${Math.min(i + batch.length, lessons.length)}/${lessons.length} lessons`);
    }

    console.log('✅ Lessons migrated successfully');
}

// ============================================================================
// Main Migration
// ============================================================================

async function runMigration() {
    console.log('🚀 Starting Data Migration\n');
    console.log('⚠️  WARNING: This will import data into your Supabase database!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    // Wait 5 seconds before starting
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        // Optional: Clear existing data (comment out if you want to keep existing data)
        // console.log('\n⚠️  Clearing existing data...');
        // await clearTable('lessons');
        // await clearTable('payments');
        // await clearTable('clients');

        // Run migrations in order (clients must be first due to foreign keys)
        await migrateClients();
        await migratePayments();
        await migrateLessons();

        console.log('\n✅ Migration completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Verify data in Supabase dashboard');
        console.log('2. Check client_summary view for hours balance');
        console.log('3. Test web interface');
        console.log('4. Backup CSV files and remove from exports folder');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// ============================================================================
// Run Migration
// ============================================================================

// Check if CSV files exist
const missingFiles = [];
Object.entries(FILES).forEach(([name, filePath]) => {
    if (!fs.existsSync(filePath)) {
        missingFiles.push(`${name}.csv`);
    }
});

if (missingFiles.length > 0) {
    console.error('❌ Missing CSV files in database/exports/:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    console.error('\nExport your Google Sheets as CSV and place them in database/exports/');
    process.exit(1);
}

// Run the migration
runMigration();
