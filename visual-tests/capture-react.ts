import { capture } from './capture';

const baseUrl = process.env.REACT_URL ?? 'http://localhost:4300';

capture('react', baseUrl).catch((error) => {
    console.error(error);
    process.exit(1);
});
