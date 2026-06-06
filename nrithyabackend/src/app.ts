import fastify, {
  FastifyInstance,
} from "fastify";
import authRoutes from "./auth/routes/auth.routes";
import userRoutes from "./users/routes/user.routes";
import courseRoutes from "./course/routes/course.routes";
import batchRoutes from "./batch/routes/batch.routes";
import studentRoutes from "./student/routes/student.route";
import superAdminRoutes from "./frequency/routes/frequency.routes";
import teacherRoutes from "./teacher/routes/teacher.routes";
import compensationRoutes from "./compensation/routes/compensation.routes";
import assignmentRoutes from "./assignment/routes/assignment.routes";
import feeRoutes from "./fee/routes/fee.routes";
import calendarRoutes from './calender/routes/calendar.routes';
import attendanceRoutes from './attendance/routes/attendace.routes';
import enquiryRoutes from "./enquiries/routes/enquiries.routes";
import fastifyCron from 'fastify-cron';
import { FeeController } from "./fee/services/fee.services";
import { CalendarController } from "./calender/services/calendar.services";
import auditRoute from "./audit/routes/audit.routes";
import dashboardRoutes from "./dashboard/routes/dashboard.routes";
import reportRoutes from "./report/routes/report.routes";
import bankRoutes from "./bank/routes/bank.routes";
import multer from "fastify-multer";

const app: FastifyInstance = fastify({
  logger: true,
});

app.register(multer.contentParser)
app.register(authRoutes, { prefix: "/auth" });
app.register(superAdminRoutes, { prefix: "/followfrequency" });
app.register(userRoutes, { prefix: "/users" });
app.register(studentRoutes, { prefix: "/students" });
app.register(courseRoutes, { prefix: "/courses" });
app.register(batchRoutes, { prefix: "/batches" });
app.register(teacherRoutes, { prefix: "/teachers" });
app.register(compensationRoutes, { prefix: "/compensation" });
app.register(assignmentRoutes, { prefix: "/assignments" });
app.register(feeRoutes, {prefix: "/fee"});
app.register(calendarRoutes, { prefix: "/calendar" });
app.register(attendanceRoutes, { prefix: "/attendance" });
app.register(enquiryRoutes,{prefix:"/enquries"})
app.register(auditRoute,{prefix:"/auditlog"})
app.register(bankRoutes,{prefix:"/bankdetails"})

app.register(dashboardRoutes,{prefix:"/dashboard"})
app.register(reportRoutes,{prefix:"/reports"})


app.register(fastifyCron, {
  jobs: [
    {
      cronTime: '*/5 * * * *',
      onTick: async server => {
        const fees = new FeeController();
        fees.createDue()
        const calendar = new CalendarController();
        calendar.populateCalendar()
      }
    }
  ]
})

export default app;
