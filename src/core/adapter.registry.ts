import { Injectable } from '@nestjs/common';
import { PlatformAdapter } from './adapter.interface';

@Injectable()
export class AdapterRegistry {
  private adapters: PlatformAdapter[] = [];

  register(adapter: PlatformAdapter) {
    this.adapters.push(adapter);
    console.log(`[AdapterRegistry] Registered adapter: ${adapter.platformName}`);
  }

  getAdapter(url: string): PlatformAdapter | undefined {
    return this.adapters.find((adapter) => adapter.matches(url));
  }

  getAdapterByName(name: string): PlatformAdapter | undefined {
    return this.adapters.find((adapter) => adapter.platformName.toLowerCase() === name.toLowerCase());
  }

  getAllAdapters(): string[] {
    return this.adapters.map((a) => a.platformName);
  }
}
