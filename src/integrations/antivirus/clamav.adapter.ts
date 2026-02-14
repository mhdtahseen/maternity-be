import { Injectable } from '@nestjs/common';

@Injectable()
export class ClamavAdapter {
  async scanObject(_bucket: string, _objectKey: string): Promise<{ clean: boolean; signature?: string }> {
    // Placeholder for real ClamAV integration.
    return { clean: true };
  }
}
