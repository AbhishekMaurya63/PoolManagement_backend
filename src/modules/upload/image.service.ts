import { Injectable } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import * as fs from 'fs';

@Injectable()
export class ImageService {

  async uploadToHostinger(localPath: string, filename: string) {
    const client = new ftp.Client();
    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: Number(process.env.FTP_PORT),
        secure: false,
      });
      await client.cd('domains');
      await client.cd('storage.aquasportsbbnacademy.com');
      await client.cd('public_html');

      // ensure uploads exists
      await client.ensureDir('uploads');

      await client.uploadFrom(localPath, filename);
      console.log(await client.pwd(), "1");
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

      // 🔥 Navigate step-by-step (same as upload)
      await client.cd('domains');
      await client.cd('aquasportsbbnacademy.com');
      await client.cd('public_html');
      await client.cd('uploads');

      // 🔥 Delete file
      await client.remove(filename);

      return { message: 'Deleted successfully' };

    } catch (error) {
      throw new Error('Delete failed: ' + error.message);
    } finally {
      client.close();
    }
  }
}