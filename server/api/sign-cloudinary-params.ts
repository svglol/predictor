import { v2 as cloudinary } from 'cloudinary'
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})
export default eventHandler<{
  body: string
}>(async event => {
  const body = await readBody(event)
  const parsedBody: { paramsToSign: { timestamp: string; source: string } } =
    JSON.parse(body)

  const signature = await cloudinary.utils.api_sign_request(
    parsedBody.paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  )
  return { signature }
})
