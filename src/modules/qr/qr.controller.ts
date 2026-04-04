import { Controller, Post, Param, Get, UseGuards, Query, Req, Res } from '@nestjs/common';
import { QRService } from './qr.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '../users/entity/user.entity';
import { Roles } from 'src/common/decorators/role.decorater';

@Controller('qr')
export class QRController {
  constructor(private service: QRService) {}

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(':paymentId')
  generate(@Param('paymentId') paymentId: string) {
    return this.service.generate(paymentId);
  }

@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(':paymentId')
  getQR(@Param('paymentId') paymentId: string) {
    return this.service.getQR(paymentId);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get('validate/:token')
  validate(@Param('token') token: string) {
    return this.service.validate(token);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

@UseGuards(JwtAuthGuard,RolesGuard)
  @Get('student/me')
  findById(@Req() req: any) {
    const userId = req.user.userId;
    return this.service.findById(userId);
  }

  // controller
@Get('download-qr')
async downloadQR(@Query('url') url: string, @Res() res:any) {
  console.log('Download URL:', url);
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=qr.png'
    );

    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Download failed');
  }
}
}