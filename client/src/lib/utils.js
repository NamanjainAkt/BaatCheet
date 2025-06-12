export function formatMessageTime(date){
    return new Date(date).toLocaleString('en-US',{
        hour12:false,
        hour:'2-digit',
        minute:'2-digit'
    })
}