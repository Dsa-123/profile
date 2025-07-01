export default function handler(req, res) {
    let status = process.env.STATUS || 1;
    const time = new Date();
    const hour = (time.getUTCHours() + 3) % 24;

    if (hour >= 0 && hour < 10){
        status = 4;
    }

    res.status(200).json({
        success: true,
        status: Number(status)
    })
}