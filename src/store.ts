import { VueElement, reactive } from "vue";

type CompInOperationType = VueElement | null;
interface StoreData {
  compInOperation: CompInOperationType;
  activatedKey: number;
  showMenuCardId: number;
  setComInOperation: (comp: CompInOperationType) => void;
  setActivatedKey: (key: number) => void;
  setShowMenuCardId: (id: number) => void;
}

const data: StoreData = {
  compInOperation: null,
  activatedKey: 0,
  showMenuCardId: 0,
  setComInOperation(item: VueElement | null) {
    this.compInOperation = item;
  },
  setActivatedKey(key: number) {
    this.activatedKey = key;
  },
  setShowMenuCardId(key: number) {
    this.showMenuCardId = key;
  },
};

const store = reactive(data);
export default store;
