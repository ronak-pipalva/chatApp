import {
  getProfileFromDb,
  upadteProfileInDb,
} from "../services/profile_services.js";

const getProfile = async (req, next) => {
  const user_id = req.user._id;

  const result = await getProfileFromDb(user_id);

  if (result.data == null) {
    return Promise.reject({
      data: result.data,
      message_type: result.message_type,
      module_name: result.module_name,
      type: result.type,
    });
  }

  return {
    data: result.data,
    message_type: result.message_type,
    module_name: result.module_name,
    type: result.type,
  };
};

const updateProfile = async (req, next) => {
  const user_id = req.user._id;
  const profile_image = req.files?.profile_image;

  let data_to_update = req.body;

  if (profile_image.length) {
    data_to_update.profile_image = profile_image;
  }

  const result = await upadteProfileInDb(data_to_update, user_id);

  if (result.data == null) {
    return Promise.reject({
      data: result.data,
      message_type: result.message_type,
      module_name: result.module_name,
      type: result.type,
    });
  }

  return {
    data: result.data,
    message_type: result.message_type,
    module_name: result.module_name,
    type: result.type,
  };
};

export { getProfile, updateProfile };
