export const CATEGORIES = ['Marketing', 'Utility', 'Authentication'];

export const LANGUAGES = [
 { code: 'en_US', label: 'English (US)' },
 { code: 'en_GB', label: 'English (UK)' },
 { code: 'hi', label: 'Hindi' },
 { code: 'es', label: 'Spanish' },
 { code: 'fr', label: 'French' },
 { code: 'de', label: 'German' },
 { code: 'pt_BR', label: 'Portuguese (Brazil)' },
 { code: 'ar', label: 'Arabic' },
 { code: 'id', label: 'Indonesian' },
];

export const langMap: Record<string, string> = {
 'English (US)': 'en_US',
 'English (UK)': 'en_GB',
 'Hindi': 'hi',
 'Spanish': 'es',
 'French': 'fr',
 'German': 'de',
 'Portuguese (Brazil)': 'pt_BR',
 'Arabic': 'ar',
 'Indonesian': 'id'
};

export const categoryMap: Record<string, string> = {
 'Marketing': 'MARKETING',
 'Utility': 'UTILITY',
 'Authentication': 'AUTHENTICATION'
};
