import { VueElement, reactive } from "vue";

type CompInOperationType = VueElement | null;
interface StoreData {
  compInOperation: CompInOperationType;
  activatedKey: number;
  showMenuCardId: number;
  showAddCardId: number;
  isDragging: number;
  setComInOperation: (comp: CompInOperationType) => void;
  setActivatedKey: (key: number) => void;
  setShowMenuCardId: (id: number) => void;
  setShowAddCardId: (id: number) => void;
  setDragging: (isDragging: number) => void;
}

const data: StoreData = {
  compInOperation: null,
  activatedKey: 0,
  showMenuCardId: 0,
  showAddCardId: 0,
  isDragging: 0,
  setComInOperation(item: VueElement | null) {
    this.compInOperation = item;
  },
  setActivatedKey(key: number) {
    this.activatedKey = key;
  },
  setShowMenuCardId(key: number) {
    this.showMenuCardId = key;
  },
  setShowAddCardId(key: number) {
    this.showAddCardId = key;
  },
  setDragging(isDragging: number) {
    this.isDragging = isDragging;
  },
};

const store = reactive(data);
export default store;
