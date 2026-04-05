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
        src="https://maps.google.com/maps?q=Old+Gajuwaka+Visakhapatnam+530026+Andhra+Pradesh+India&z=16&output=embed"
      />
    </div>
  );
};

export default Map;
