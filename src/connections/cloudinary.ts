import { v2 } from "cloudinary";
import { CLOUD_KEY, CLOUD_NAME, CLOUD_SECRET } from "../config";

const { config } = v2;

config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUD_SECRET
});

export default v2;