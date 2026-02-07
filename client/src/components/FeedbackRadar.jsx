import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const FeedbackRadar = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#666" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#8884d8"
                        strokeWidth={3}
                        fill="#8884d8"
                        fillOpacity={0.6}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FeedbackRadar;
