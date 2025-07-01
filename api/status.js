export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://it-dsa.vercel.app');
    try {
        let status = parseInt(process.env.STATUS) || 1;
        const time = new Date();
        const hour = (time.getUTCHours() + 3) % 24;

        if (hour >= 0 && hour < 10){
            status = 4;
        }

        res.status(200).json({
            success: true,
            status: status
        })
    } catch(error){
        console.error("Error in status.js: ", error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}