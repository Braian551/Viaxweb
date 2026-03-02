import React from 'react';
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

export const CHART_COLORS = ['#2196f3', '#00bcd4', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];

const ViaxTooltip = ({ active, payload, label, valueFormatter }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="v-chart-tooltip">
            {label ? <div className="v-chart-tooltip__title">{label}</div> : null}
            {payload.map((item) => (
                <div key={item.dataKey} className="v-chart-tooltip__item">
                    <span className="v-chart-tooltip__dot" style={{ background: item.color }} />
                    <span className="v-chart-tooltip__name">{item.name}</span>
                    <strong className="v-chart-tooltip__value">
                        {valueFormatter ? valueFormatter(item.value, item.name) : item.value}
                    </strong>
                </div>
            ))}
        </div>
    );
};

export const ViaxBarChart = ({ data, xKey, bars, height = 260, valueFormatter }) => (
    <div className="v-chart-wrap" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                <XAxis dataKey={xKey} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ViaxTooltip valueFormatter={valueFormatter} />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                <Legend />
                {bars.map((bar, index) => (
                    <Bar
                        key={bar.dataKey}
                        dataKey={bar.dataKey}
                        name={bar.name}
                        fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
                        radius={[8, 8, 0, 0]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export const ViaxAreaChart = ({ data, xKey, areas, height = 260, valueFormatter }) => (
    <div className="v-chart-wrap" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    {areas.map((area, index) => {
                        const color = area.color || CHART_COLORS[index % CHART_COLORS.length];
                        return (
                            <linearGradient id={`viaxArea${area.dataKey}`} key={area.dataKey} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                            </linearGradient>
                        );
                    })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                <XAxis dataKey={xKey} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ViaxTooltip valueFormatter={valueFormatter} />} />
                <Legend />
                {areas.map((area, index) => {
                    const color = area.color || CHART_COLORS[index % CHART_COLORS.length];
                    return (
                        <Area
                            key={area.dataKey}
                            type="monotone"
                            dataKey={area.dataKey}
                            name={area.name}
                            stroke={color}
                            strokeWidth={2.2}
                            fill={`url(#viaxArea${area.dataKey})`}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    );
                })}
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export const ViaxDonutChart = ({
    data,
    dataKey = 'value',
    nameKey = 'name',
    height = 260,
    innerRadius = 52,
    outerRadius = 82,
    valueFormatter,
}) => (
    <div className="v-chart-wrap" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip content={<ViaxTooltip valueFormatter={valueFormatter} />} />
                <Legend />
                <Pie
                    data={data}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={2}
                >
                    {data.map((entry, index) => (
                        <Cell key={`${entry[nameKey]}-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    </div>
);
