import { useParams } from "react-router-dom";
import TodoPage from "../components/TodoPage";
import { useEffect, useState } from "react";
import api from "../api/axios";

function ListPage() {
  const { listId } = useParams();
  const [listName, setListName] = useState("Liste");

  // Fetch the list name to pass as a title
  useEffect(() => {
    const fetchListName = async () => {
      try {
        // This is inefficient. A dedicated endpoint `GET /Lists/{id}` would be better.
        const response = await api.get('/Lists/list');
        const currentList = response.data.find(l => l.listID == listId);
        if (currentList) {
          setListName(currentList.listName);
        }
      } catch (error) {
        console.error("Could not fetch list name", error);
      }
    };
    fetchListName();
  }, [listId]);

  return <TodoPage title={listName} listId={listId} />;
}

export default ListPage;

