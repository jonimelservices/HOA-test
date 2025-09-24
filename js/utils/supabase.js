// Access the global Supabase client
export const supabase = window.supabaseClient;

// Generic helpers to improve reliability of Supabase calls
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (promise, ms) => {
  let t;
  return new Promise((resolve, reject) => {
    t = setTimeout(() => reject(new Error('Request timed out')), ms);
    Promise.resolve(promise).then(
      (value) => { clearTimeout(t); resolve(value); },
      (err) => { clearTimeout(t); reject(err); }
    );
  });
};
const withRetry = async (fn, { retries = 2, backoffMs = 400 } = {}) => {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); } catch (e) { lastErr = e; if (i < retries) await sleep(backoffMs * Math.pow(2, i)); }
  }
  throw lastErr;
};
export const supa = async (op, { timeoutMs = 25000, retries = 2 } = {}) => {
  return withRetry(() => withTimeout(Promise.resolve().then(op), timeoutMs), { retries });
};

export const triggerNotification = async (type, subject, showNotification) => {
    try {
        const { error } = await supabase.functions.invoke('send-notifications', {
            body: JSON.stringify({ type, subject }),
        });
        if (error) throw error;
        showNotification("Notifications sent to members.");
    } catch (error) {
        console.error("Error sending notification:", error.message);
        showNotification("Could not send notifications.");
    }
};

export const logAccess = async (user, documentName) => {
    try {
        const { error } = await supabase.from('access_logs').insert({
            user_id: user.id,
            user_email: user.email,
            document_name: documentName
        });
        if (error) throw error;
    } catch (error) {
        console.error("Error logging access:", error.message);
    }
};
