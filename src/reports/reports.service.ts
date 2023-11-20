import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-reports.dto';
import { Report } from './report.entity';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);

    report.user = user;

    return this.repo.save(report);
  }

  createEstimate({ make, model, lng, lat, year, milage }: GetEstimateDto) {
    return this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make =:make', { make })
      .andWhere('model=:model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(milage -:milage)', 'DESC') // does not take a parameter object as a second argument
      .setParameters({ milage })
      .limit(3)
      .getRawOne();
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne({
      where: { id: parseInt(id) },
      relations: ['user'],
    });

    if (!report) {
      throw new NotFoundException('report not found.');
    }

    report.approved = approved;

    return this.repo.save(report);
  }
}
