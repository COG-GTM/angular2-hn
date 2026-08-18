import { capture } from './capture';

const sourceUrl = process.env.SOURCE_URL ?? 'http://localhost:4200';
const reactUrl = process.env.REACT_URL ?? 'http://localhost:4300';

async function main(): Promise<void> {
    await capture('source', sourceUrl);
    await capture('react', reactUrl);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
