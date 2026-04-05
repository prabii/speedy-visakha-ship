const Map = () => {
  return (
    <div className="w-full h-80 rounded-lg overflow-hidden shadow-elegant">
      <iframe
        title="Visakha International Couriers Location"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://maps.google.com/maps?q=17.684784,83.2025349&z=17&output=embed"
      />
    </div>
  );
};

export default Map;
