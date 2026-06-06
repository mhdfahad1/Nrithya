import { FastifyReply, FastifyRequest } from "fastify";
import { Frequency } from "../entities/frequency.entities";
import { getDataSource } from "../../utils/data-source";
import { freqValue } from "../types/frequency.types";
import { Success } from "../../utils/response";
import { CustomError } from "../../utils/response";
import {
  SUCCESS_CREATE,
  INTERNAL_ERROR,
  BAD_REQUEST,
  SUCCESS_GET,
  NOT_FOUND,
} from "../../utils/common";
import { Pagination } from "../../utils/common";

class FrequencyController {  
  //LISTING ALL FREQUENCIES and CREATE FREQUENCY
  async listAllFrequency(request: FastifyRequest, reply: FastifyReply) {
    try {
      const appDatasource = await getDataSource();
      const userRepository = appDatasource.getRepository(Frequency);
      let data = await userRepository.find({
        select: [
          "freq_id",
          "fee_notification",
          "enquiry_1",
          "enquiry_2",
          "enquiry_3",
        ],
      });
      if (data.length === 0) {
        const Freqdata = new Frequency();
        Freqdata.fee_notification = 5;
        Freqdata.enquiry_1 = 1;
        Freqdata.enquiry_2 = 3;
        Freqdata.enquiry_3 = 5;
        await appDatasource.manager.save(Freqdata);
        data = await userRepository.find({
          select: [
            "freq_id",
            "fee_notification",
            "enquiry_1",
            "enquiry_2",
            "enquiry_3",
          ],
        });
      }
      const resdata = Success<any>(data);
      reply.status(SUCCESS_GET).send(resdata);
    } catch (error) {
      const data = CustomError<string>(INTERNAL_ERROR, "Bad request");
      reply.status(INTERNAL_ERROR).send(data);
    }
  }
  //UPDATE FREQUENCY
  async updateFrequency(
    request: FastifyRequest<{ Body: freqValue & { freq_id: number } }>,
    reply: FastifyReply
  ) {
    const { freq_id, ...updateData } = request.body;
    try {
      const appDatasource = await getDataSource();
      const frequencyRepository = appDatasource.getRepository(Frequency);
      const frequencyToUpdate = await frequencyRepository.findOneBy({
        freq_id: freq_id,
      });
      // Check if the frequency exists
      if (!frequencyToUpdate) {
        const errorData = CustomError<string>(404, "Frequency name not found");
        reply.status(NOT_FOUND).send(errorData);
        return;
      }
      // Modify the fields you want to change
      Object.assign(frequencyToUpdate, updateData);
      // Save the updated frequency record back to the database
      await frequencyRepository.save(frequencyToUpdate);
      const successData = Success<string>("Frequency updated successfully");
      reply.status(SUCCESS_GET).send(successData);
    } catch (error) {
      console.error("Error updating frequency:", error);
      const errorData = CustomError<string>(500, "Internal server error");
      reply.status(INTERNAL_ERROR).send(errorData);
    }
  }
}

export default FrequencyController;
