/**
 * db_service.js
 * @description: exports all database-related methods for Mongoose
 */

// create one record
const createOne = async (model, data) => new model(data).save();

// create multiple records
const createMany = async (model, data) => model.insertMany(data);

// update record(s) when query matches
const update = async (model, query, data) => {
  query = queryBuilderParser(query);
  const result = await model.findOneAndUpdate(query, data);

  return model.find(query); // fetch updated records
};

// delete record(s) when query matches
const destroy = async (model, query) => {
  query = queryBuilderParser(query);
  const result = await model.find(query); // store records to return before deletion
  await model.deleteMany(query);
  return result;
};

// delete record using primary key (assumes ObjectId)
const deleteByPk = async (model, pk) => model.findByIdAndDelete(pk);

// find single record
const findOne = async (model, query, options = {}) => {
  try {
    query = queryBuilderParser(query);
    return model.findOne(query, null, options);
  } catch (error) {
    console.error(error);
  }
};

// find multiple records with pagination
const paginate = async (model, query, options = {}) => {
  try {
    query = queryBuilderParser(query);
    const page = options.page || 1;
    const limit = options.paginate || 25;
    const select = options.select ? options.select.join(" ") : null;
    const sort = options.sort ? sortParser(options.sort) : null;
    const include = options.include || [];

    const result = await model
      .find(query)
      .select(select)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(include);

    const total = await model.countDocuments(query);
    return {
      data: result,
      paginator: {
        itemCount: total,
        perPage: limit,
        pageCount: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error(error);
  }
};

// find multiple records without pagination
const findAll = async (model, query, options = {}) => {
  try {
    query = queryBuilderParser(query);
    const select = options.select ? options.select.join(" ") : null;
    const sort = options.sort ? sortParser(options.sort) : null;
    const include = options.include || [];

    return model.find(query).select(select).sort(sort).populate(include);
  } catch (error) {
    console.error(error);
  }
};

// count records for specified query
const count = async (model, query) => {
  query = queryBuilderParser(query);
  return model.countDocuments(query);
};

// upsert (update or insert if it doesn't exist)
const upsert = async (model, data) =>
  model.findOneAndUpdate(data, data, { upsert: true, new: true });

/*
 * @description : parser for query builder
 * @param  {obj} data : query object with operators
 * @return {obj} data : parsed query object
 */
const queryBuilderParser = (data) => {
  const operators = {
    $and: "$and",
    $or: "$or",
    $in: "$in",
    $eq: "$eq",
    $gt: "$gt",
    $lt: "$lt",
    $gte: "$gte",
    $lte: "$lte",
    $ne: "$ne",
    $nin: "$nin",
    $exists: "$exists",
  };

  if (data) {
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "object" && !Array.isArray(data[key])) {
        queryBuilderParser(data[key]);
      }
      if (key in operators) {
        data[operators[key]] = data[key];
        delete data[key];
      }
    });
  }

  return data;
};

/*
 * @description : parser for sorting options
 * @param  {obj} input : sorting input
 * @return {obj} : parsed sort object
 */
const sortParser = (input) => {
  const sortObject = {};
  if (input) {
    Object.entries(input).forEach(([key, value]) => {
      sortObject[key] = value === 1 ? "asc" : "desc";
    });
  }
  return sortObject;
};

/*
 * @description : find and count multiple records with pagination
 * @param  {obj} data : {}
 * @return {obj} data : query
 */
const findAndCountAll = async (model, query, options = {}) => {
  try {
    const { page = 1, paginate = 25 } = options;
    query = queryBuilderParser(query);
    const select = options.select ? options.select.join(" ") : null;
    const sort = options.sort ? sortParser(options.sort) : null;
    const include = options.include || [];

    const result = await model
      .find(query)
      .select(select)
      .sort(sort)
      .limit(paginate)
      .skip((page - 1) * paginate)
      .populate(include);

    const total = await model.countDocuments(query);
    return {
      data: result,
      paginator: {
        itemCount: total,
        perPage: paginate,
        pageCount: Math.ceil(total / paginate),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error(error);
  }
};

export default {
  findOne,
  createOne,
  createMany,
  update,
  destroy,
  deleteByPk,
  findAll,
  findAndCountAll,
  count,
  upsert,
  paginate,
  queryBuilderParser,
  sortParser,
};
