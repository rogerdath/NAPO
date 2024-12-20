import { ContractStorage } from '@/components/contract/contract-storage';
import { ContractManager } from '@/components/contract/contract-manager';
import { loadContracts } from '@/app/actions/contract-actions';

export default async function ContractManagerPage() {
    // Load initial data from server
    const initialContracts = await loadContracts();

    return (
        <>
            {/* Client-side storage handler */}
            <ContractStorage initialContracts={initialContracts} />
            
            {/* Main contract manager UI */}
            <ContractManager initialContracts={initialContracts} />
        </>
    );
} 