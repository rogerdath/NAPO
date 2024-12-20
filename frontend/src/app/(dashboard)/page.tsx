import { MapPin, Car, FileText, BarChart3 } from 'lucide-react';

const stats = [
    {
        name: 'Aktive områder',
        value: '12',
        icon: MapPin,
        change: '+2.1%',
        changeType: 'positive',
    },
    {
        name: 'Tilgjengelige kjøretøy',
        value: '24',
        icon: Car,
        change: '-0.4%',
        changeType: 'negative',
    },
    {
        name: 'Aktive avtaler',
        value: '38',
        icon: FileText,
        change: '+4.3%',
        changeType: 'positive',
    },
    {
        name: 'Gjennomsnittlig utnyttelse',
        value: '87%',
        icon: BarChart3,
        change: '+2.7%',
        changeType: 'positive',
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Oversikt over ruteoptimalisering og ressursutnyttelse
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <stat.icon
                                        className="h-6 w-6 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                            {stat.name}
                                        </dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                                                {stat.value}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                            <div className="text-sm">
                                <span
                                    className={`${stat.changeType === 'positive'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}
                                >
                                    {stat.change}
                                </span>
                                <span className="text-gray-600 dark:text-gray-300">
                                    {' '}
                                    fra forrige periode
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Aktive ruter
                    </h2>
                    <div className="mt-4 aspect-[16/9] w-full bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {/* MapComponent vil bli lagt til her */}
                    </div>
                </div>
            </div>
        </div>
    );
} 