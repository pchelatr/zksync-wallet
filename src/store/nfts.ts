import Vue from "vue";
import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import { ModuleOptions } from "@matterlabs/zksync-nuxt-core/types";
import { ZkNFTState, NFTItem } from "@/types/lib";

const nftCIDPromise: {
  [cid: string]: Promise<any>;
} = {};

export const state = (): ZkNFTState => ({
  nfts: {},
  nftsLoading: {},
});

export const getters = getterTree(state, {
  getNFTs: (state: ZkNFTState) => state.nfts,
  getNFT: (state: ZkNFTState) => (cid: string) => state.nfts[cid],
  getNFTsLoading: (state: ZkNFTState) => state.nftsLoading,
  getNFTLoading: (state: ZkNFTState) => (cid: string) => state.nftsLoading[cid],
});

export const mutations = mutationTree(state, {
  setNFT(state: ZkNFTState, nft: NFTItem): void {
    Vue.set(state.nfts, nft.cid, nft);
  },
  setNFTLoading(state: ZkNFTState, { cid, status }: { cid: string; status: boolean }): void {
    Vue.set(state.nftsLoading, cid, status);
  },
  clear(state: ZkNFTState) {
    Vue.set(state, "nfts", {});
    Vue.set(state, "nftsLoading", {});
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async requestNFT({ commit, getters, rootGetters }, { cid, force }: { cid: string; force: boolean }): Promise<void> {
      /* ..aaaa is empty cid */
      if (cid === "bafyreiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") {
        return;
      }
      const savedNFT = getters.getNFT(cid);
      if (savedNFT && !force) {
        return;
      }
      commit("setNFTLoading", { cid, status: true });
      try {
        const ipfsGateway = <ModuleOptions>rootGetters["zk-onboard/options"].ipfsGateway;
        if (!nftCIDPromise[cid] || force) {
          nftCIDPromise[cid] = fetch(`${ipfsGateway}/ipfs/${cid}/metadata.json`);
        }
        const res = await nftCIDPromise[cid];
        if (res && res.ok !== true) {
          commit("setNFT", {
            cid,
            exists: false,
          });
          return;
        }
        const data = await res.json();
        if (typeof data === "object" && (data.image || data.name || data.description)) {
          if (typeof data.image === "string") {
            if (data.image.startsWith("ipfs://")) {
              data.image = data.image.replace("ipfs://", ipfsGateway + "/ipfs/");
            }
          }
          commit("setNFT", {
            cid,
            exists: true,
            image: data.image,
            name: data.name,
            description: data.description,
          });
        }
      } catch (error) {
        console.warn(`Error requesting NFT with CID ${cid}\n`, error);
      } finally {
        delete nftCIDPromise[cid];
        commit("setNFTLoading", { cid, status: false });
      }
    },
  },
);

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {},
});