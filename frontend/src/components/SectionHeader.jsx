import React from 'react';

export default function SectionHeader({ title }) {
  return (
    <h2 style={{ marginTop: "2rem", marginBottom: "1rem", fontSize: "1.25rem" }}>
      {title}
    </h2>
  );
}