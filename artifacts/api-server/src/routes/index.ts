import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import clientsRouter from "./clients";
import tasksRouter from "./tasks";
import earningsRouter from "./earnings";
import messagesRouter from "./messages";
import plansRouter from "./plans";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(clientsRouter);
router.use(tasksRouter);
router.use(earningsRouter);
router.use(messagesRouter);
router.use(plansRouter);
router.use(analyticsRouter);

export default router;
