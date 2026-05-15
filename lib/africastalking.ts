const AfricasTalking = require('africastalking')

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY!,
  username: process.env.AT_USERNAME!,
})

export async function sendSMS(phone: string, message: string) {
  try {
    const result = await at.SMS.send({
      to: [phone],
      message,
      from: 'Gotera',
    })
    console.log('SMS sent:', result)
  } catch (error) {
    console.error('SMS error:', error)
  }
}
