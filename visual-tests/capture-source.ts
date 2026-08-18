import { capture } from './capture';

const baseUrl = process.env.SOURCE_URL ?? 'http://localhost:4200';

capture('source', baseUrl).catch((error) => {
    console.error(error);
    process.exit(1);
});
