import { Injectable } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import * as fs from 'fs';

@Injectable()
export class ImageService {

  async uploadToHostinger(localPath: string, filename: string) {
    const client = new ftp.Client();
    console.log('Uploading to Hostinger with FTP credentials:', {
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      port: process.env.FTP_PORT,
    });
    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: Number(process.env.FTP_PORT),
        secure: false,
      });

      const remotePath = `/public_html/uploads/${filename}`;

      await client.uploadFrom(localPath, remotePath);

      return {
        url: `${process.env.BASE_URL}/uploads/${filename}`,
        filename,
      };

    } catch (error) {
      throw new Error('Upload failed: ' + error.message);
    } finally {
      client.close();
      fs.unlinkSync(localPath); // delete temp file
    }
  }

  async deleteFromHostinger(filename: string) {
    const client = new ftp.Client();

    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: Number(process.env.FTP_PORT),
        secure: false,
      });

      await client.remove(`/public_html/uploads/${filename}`);

      return { message: 'Deleted successfully' };

    } catch (error) {
      throw new Error('Delete failed: ' + error.message);
    } finally {
      client.close();
    }
  }
}