const Notifications = () => {
  const items = [
    "New patient registration",
    "Doctor unavailable",
    "Pending approval",
  ];

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="font-semibold mb-2">Recent notifications</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
