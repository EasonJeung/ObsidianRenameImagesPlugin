import { App, Vault } from 'obsidian';

export const path = {
    /*
     Example: 
     Year/Month/Week/day demo file.md
                  ||
                  \/
     [Year, Month, Week, day demo file]
    */ 
    split(fullPath: string): string[] {
        let segments: string[] = [];

        // Remove the extension
        let pathNoExt = fullPath.substring(0, fullPath.lastIndexOf("."));

        segments = segments.concat(pathNoExt.split('/'));

        return segments
    }

    
}

interface VaultConfig {
	useMarkdownLinks?: boolean
}

interface VaultWithConfig extends Vault {
	config?: VaultConfig,
}

export function getVaultConfig(app: App): VaultConfig|null {
	const vault = app.vault as VaultWithConfig
	return vault.config
}