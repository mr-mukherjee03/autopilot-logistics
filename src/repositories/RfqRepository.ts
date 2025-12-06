import RfqModel, { IRFQ } from '../models/RfqModel';

// The Data Access Layer
export class RfqRepository {
    async findByPlatformId(id: string): Promise<IRFQ | null> {
        return await RfqModel.findOne({ platformId: id });
    }

    async createOrUpdate(data: Partial<IRFQ>): Promise<IRFQ> {
        return await RfqModel.findOneAndUpdate(
            { platformId: data.platformId },
            data,
            { upsert: true, new: true }
        );
    }
}