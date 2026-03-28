import { Injectable } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import * as fs from 'fs';
import { Readable } from 'stream';
@Injectable()
export class ImageService {

async uploadToHostinger(file: string | Buffer, filename: string) {

  const client = new ftp.Client();
  console.log(process.env.FTP_HOST, process.env.FTP_USER, process.env.FTP_PASSWORD, process.env.FTP_PORT);
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

    await client.ensureDir('uploads');
    // ✅ HANDLE BOTH CASES
    if (file instanceof Buffer) {
      const stream = Readable.from(file);
      await client.uploadFrom(stream, filename);
    } else {
      await client.uploadFrom(file as string, filename);
    }

    return {
      url: `${process.env.BASE_URL}/uploads/${filename}`,
      filename,
    };

  } catch (error) {
    throw new Error('Upload failed: ' + error.message);
  } finally {
    client.close();

    // ✅ ONLY DELETE IF FILE PATH
    if (typeof file === 'string') {
      fs.unlinkSync(file);
    }
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
      await client.cd('storage.aquasportsbbnacademy.com');
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