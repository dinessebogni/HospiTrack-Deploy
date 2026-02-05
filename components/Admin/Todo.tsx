interface TodoProps {
  medecinName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Todo = ({ medecinName, onConfirm, onCancel }: TodoProps) => {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="font-semibold mb-2">Confirmation</h2>
      <p className="mb-4">Voulez-vous approuver l'inscription de {medecinName} ?</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Oui
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Non
        </button>
      </div>
    </div>
  );
};

export default Todo;
