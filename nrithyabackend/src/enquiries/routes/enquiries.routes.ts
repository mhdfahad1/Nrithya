import { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Middlewares } from "../../middlewares/middlewares";
import { EnquiriesControllers } from "../services/enquiries.services";

async function routes(app:FastifyInstance) {
    const enquiriesMidleware = new Middlewares();
    const enquiriesControllers = new EnquiriesControllers();

    // ENQUIRIES ROUTES
    app.post("/", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.createEnquiry as RouteHandlerMethod);
    app.get("/", {preHandler:[enquiriesMidleware.authorize]}, enquiriesControllers.listAllEnquiry as RouteHandlerMethod);
    app.get("/:enquiry_id", {preHandler:[enquiriesMidleware.authorize]}, enquiriesControllers.listEnquiry as RouteHandlerMethod);
    app.patch("/", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.updateEnquiry as RouteHandlerMethod);
    app.put("/", {preHandler:[enquiriesMidleware.authorize,enquiriesMidleware.adminAccess]},enquiriesControllers.updateFollowUpDate as RouteHandlerMethod)
    app.delete("/", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.deleteEnquiry as RouteHandlerMethod)

    // ENQUIRIES TYPES ROUTE
    app.post("/types", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.createEnquiryType as RouteHandlerMethod)
    app.get("/types", {preHandler:[enquiriesMidleware.authorize]}, enquiriesControllers.listAllEnquiryTypes as RouteHandlerMethod)
    app.get("/types/:enquiry_type_id", {preHandler:[enquiriesMidleware.authorize]}, enquiriesControllers.listEnquiryType as RouteHandlerMethod)
    app.put("/types", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.updateEnquiryType as RouteHandlerMethod)
    app.delete("/types", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.deleteEnquiryType as RouteHandlerMethod)

    // ENQUIRIES RESPONSE ROUTE
    // app.post("/responses", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.createEnquiryResponse as RouteHandlerMethod)
    // app.get("/responses", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.listEnquiryResponses as RouteHandlerMethod)
    // app.put("/responses", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.updateEnquiryResponse as RouteHandlerMethod)
    // app.delete("/responses", {preHandler:[enquiriesMidleware.authorize, enquiriesMidleware.adminAccess]}, enquiriesControllers.deleteEnquiryResponse as RouteHandlerMethod)
}

export default routes