import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SharedService } from 'src/app/shared/shared.service';
import { environment } from 'src/environments/environment.development';
import { NFT } from '../mint/mint.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient, private sharedService: SharedService) {}

  fetchNFts(
    skip: number,
    limit: number
  ): Observable<{ msg: string; nfts: NFT[] }> {
    return this.http
      .get<{ msg: string; nfts: NFT[] }>(
        `${environment.API}/tokens?skip=${skip}&limit=${limit}`
      )
      .pipe(map(this.sharedService.restructureNFTImage));
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

        this.sharedService.setNft(mappedNft);
        return mappedNft;
      })
    );
  }
}
