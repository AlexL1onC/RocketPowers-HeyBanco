import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchFinancialDetails } from '../api';
import { USER_ID } from '../config';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value ?? 0;

    return (
      <div style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 10,
        padding: '8px 12px',
        fontSize: 12,
      }}>
        <div style={{ marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 600 }}>
          ${value.toLocaleString('es-MX')}
        </div>
      </div>
    );
  }
  return null;
};

export default function StatsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("USER_ID:", USER_ID);

    fetchFinancialDetails(USER_ID)
      .then(res => {
        console.log("FRONT DATA:", res);
        setData(res);
      })
      .catch(err => {
        console.error("ERROR:", err);
        setData({});
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔥 Normalización segura de datos
  const categories = Array.isArray(data?.resumen_categorias)
    ? data.resumen_categorias
    : [];

  const topMerchants = Array.isArray(data?.top_comercios_por_categoria)
    ? data.top_comercios_por_categoria
    : [];

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando...</div>;
  }

  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      overflowY: 'auto',
      flex: 1
    }}>

      {/* 🔴 DEBUG VISUAL */}
      {!data && <div style={{ color: 'red' }}>No se recibieron datos</div>}

      {/* 📊 GRÁFICA */}
      <div>
        <div style={{ fontSize: 12, marginBottom: 10 }}>
          Gasto por Categoría
        </div>

        {categories.length === 0 ? (
          <div>No hay datos de categorías</div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={categories}>
              <XAxis
                dataKey="categoria"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_monto" radius={[4, 4, 0, 0]}>
                {categories.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#D85A30' : '#E8E5DF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 🏪 LISTA */}
      <div>
        <div style={{ fontSize: 12, marginBottom: 10 }}>
          Principales Comercios
        </div>

        {topMerchants.length === 0 ? (
          <div>No hay comercios disponibles</div>
        ) : (
          topMerchants.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #eee'
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {item?.comercio || 'N/A'}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  {item?.categoria || 'Sin categoría'}
                </div>
              </div>
              <div style={{ fontWeight: 600 }}>
                ${(item?.total_monto ?? 0).toLocaleString('es-MX')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
