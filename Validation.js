const Joi = require("@hapi/joi");
const { JSONCookie } = require("cookie-parser");

//Registration Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required()
  });

  return schema.validate(data);
};
//Registration Validation Consumer/Provider
const registerValidationB = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required()
  });

  return schema.validate(data);
};
//Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
  });

  return schema.validate(data);
};

//Availablity Validation
const addAvailablityValidation = (data) => {
  const schema = Joi.object({
    day: Joi.number().required().greater(-1).less(7),
    startTime: Joi.number().required().greater(-1).less(24),
    endTime: Joi.number().required().greater(-1).less(24)
  });
  return schema.validate(data);
};

// Delete Availability
const deleteAvailablityValidation = (data) => {
  const schema = Joi.object({
    slot_id: Joi.string().required()
  });
  return schema.validate(data);
};

//Edit Availability
const editAvailablityValidation = (data) => {
  const schema = Joi.object({
    slot_id: Joi.string().required(),
    startTime: Joi.number().required().greater(-1).less(24),
    endTime: Joi.number().required().greater(-1).less(24)
  });
  return schema.validate(data);
};
//Add Service
const addServiceValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    hours: Joi.number().required().greater(0).less(24)
  });
  return schema.validate(data);
};
// Delete Service
const deleteServiceValidation = (data) => {
  const schema = Joi.object({
    service_id: Joi.string().required()
  });
  return schema.validate(data);
};

//Edit Service
const editServiceValidation = (data) => {
  const schema = Joi.object({
    service_id: Joi.string().required(),
    hours: Joi.number().required().greater(0).less(24)
  });
  return schema.validate(data);
};
//Create Appointment
const createAppointmentValidation = (data) => {
  const schema = Joi.object({
    date: Joi.string().isoDate().required(),
    startTime: Joi.string().required(),
    providerId: Joi.string().required(),
    serviceId: Joi.string().required()
  });
  return schema.validate(data);
};

//Delete Appointment
const deleteAppointmentValidation = (data) => {
  const schema = Joi.object({
    appointmentId: Joi.string().required()
  });
  return schema.validate(data);
};

module.exports = {
  registerValidation,
  registerValidationB,
  loginValidation,
  addAvailablityValidation,
  deleteAvailablityValidation,
  editAvailablityValidation,
  addServiceValidation,
  deleteServiceValidation,
  editServiceValidation,
  createAppointmentValidation,
  deleteAppointmentValidation
};
