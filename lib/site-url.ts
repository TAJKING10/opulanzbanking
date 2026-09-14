const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

export const baseUrl =
  rawBaseUrl && !rawBaseUrl.includes('localhost') && !rawBaseUrl.includes('azurewebsites.net')
    ? rawBaseUrl.replace(/\/$/, '')
    : 'https://www.opulanz.com';
