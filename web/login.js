// Login page logic
const { createClient } = supabase;
const supabaseClient = createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.classList.add('hidden');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    } else {
        // Redirect to main app
        window.location.href = 'index.html';
    }
});

document.getElementById('reset-password').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    if (!email) {
        alert('Please enter your email address first');
        return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://tutoring-mb.netlify.app/'
    });

    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('Password reset email sent! Check your inbox.');
    }
});
