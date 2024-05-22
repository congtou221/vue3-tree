import { VueElement, reactive } from "vue";

type CompInOperationType = VueElement | null;
interface StoreData {
  compInOperation: CompInOperationType;
  activatedKey: number;
  setComInOperation: (comp: CompInOperationType) => void;
  setActivatedKey: (key: number) => void; 
}

const data: StoreData = {
  compInOperation: null,
  activatedKey: 0,
  setComInOperation(item: VueElement | null) {
    this.compInOperation = item;
  },
  setActivatedKey(key: number) {
    this.activatedKey = key;
  },
};

const store = reactive(data);
export default store;
