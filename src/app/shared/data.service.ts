import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { SharedService } from 'src/app/shared/shared.service';
import { environment } from 'src/environments/environment.development';
import { NFT } from '../mint/mint.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  fetchListedNFts(
    skip: number,
    limit: number
  ): Observable<{ msg: string; nfts: NFT[] }> {
    return this.http
      .get<{ msg: string; nfts: NFT[] }>(
        `${environment.API}/listings?skip=${skip}&limit=${limit}`
      )
      .pipe(map(this.sharedService.restructureNFTImage));
  }

  fetchMintedNFts(
    skip: number,
    limit: number
  ): Observable<{ msg: string; nfts: NFT[] }> {
    return this.http
      .get<{ msg: string; nfts: NFT[] }>(
        `${environment.API}/tokens?skip=${skip}&limit=${limit}&minted=true`
      )
      .pipe(
        map(this.sharedService.restructureNFTImage),
        tap(({ nfts }) => {
          this.sharedService.setNFTs(nfts);
        })
      );
  }

  fetchYourNFTs(owner: string) {
    return this.http
      .get<{ msg: string; nfts: NFT[] }>(`${environment.API}/tokens/${owner}`)
      .pipe(map(this.sharedService.restructureNFTImage));
  }

  fetchNFT(idx: number, owner: string): Observable<NFT> {
    return this.http.get<NFT>(`${environment.baseURI}/${idx}`).pipe(
      map((nft) => {
        const mappedNft: NFT = {
          ...nft,
          image: nft.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
          owner,
        };

        // this.sharedService.unshiftNFT(mappedNft);
        return mappedNft;
      })
    );
  }
}
