import ApiError from "../utils/api_error.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { response_objects } from "../utils/response/response_message.js";

const uploadFile = async (req, next) => {
  try {
    const image = req.files.image;
    const video = req.files.video;
    const user_id = req.user._id;

    let folder = `chat-app/${user_id}`;

    let data_to_send = {};

    if (image) {
      const image_data = await uploadToCloudinary(image, folder);
      data_to_send.image_url = image_data.map((item) => item.secure_url);
    }

    if (video) {
      const video_data = await uploadToCloudinary(video, folder);
      data_to_send.video_url = video_data.map((item) => item.secure_url);
    }

    return {
      type: "SUCCESS",
      data: data_to_send,
    };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, response_objects[0].message);
  }
};

export { uploadFile };
