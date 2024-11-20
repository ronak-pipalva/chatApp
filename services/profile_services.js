import Models from "../models/index.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import db_services from "../utils/db_services.js";

const getProfileFromDb = async (user_id) => {
  let query = {
    _id: user_id,
  };
  const user = await db_services.findOne(Models.user, query);

  if (!user) {
    return {
      type: "NOT_FOUND",
      message_type: "",
      module_name: "User",
      data: null,
    };
  }

  return {
    type: "GET_DETAILS",
    message_type: "",
    data: user,
  };
};

const upadteProfileInDb = async (data_to_update, user_id) => {
  let query = {
    _id: user_id,
  };

  let folder = `chat-app/${user_id}/profile-image`;
  let profile_image_url;

  if (data_to_update?.profile_image?.length) {
    profile_image_url = await uploadToCloudinary(
      data_to_update.profile_image,
      folder
    );
  }

  let final_update = {
    ...data_to_update,
    profile_image: profile_image_url[0].url,
  };
  const user = await db_services.update(Models.user, query, final_update);

  if (!user.length) {
    return {
      type: "NOT_FOUND",
      message_type: "",
      module_name: "User",
      data: null,
    };
  }

  return {
    type: "UPDATE_SUCCESS",
    data: user[0],
  };
};

export { getProfileFromDb, upadteProfileInDb };
