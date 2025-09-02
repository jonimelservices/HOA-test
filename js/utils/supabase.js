// Access the global Supabase client
export const supabase = window.supabaseClient;

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
