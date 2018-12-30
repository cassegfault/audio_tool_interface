enum request_methods {
    get = "GET", 
    post = "POST", 
    put = "PUT", 
    del = "DELETE", 
}

interface RequestOptions {
    responseType?: XMLHttpRequestResponseType,

}

type RequestsResponse = any;

export default class Requests {

    static async_request(method: request_methods, url: string, data?: any, options: RequestOptions={}): Promise<RequestsResponse> {
        return new Promise(function asyn_request_promise(resolve,reject) {
            const xhr: XMLHttpRequest = new XMLHttpRequest();

            if (options.responseType) {
                xhr.responseType = options.responseType;
            }
            
            xhr.open(method, url);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === xhr.DONE) {
                    resolve(xhr.response);
                }
            }
            xhr.onerror = () => {
                reject(xhr);
            }
            xhr.send(data);
        });
    }

    static get(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        return this.async_request(request_methods.get, url, data, opts);
    }

    static post(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        return this.async_request(request_methods.post, url, data, opts);
    }

    static put(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        return this.async_request(request_methods.put, url, data, opts);
    }

    static del(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        return this.async_request(request_methods.del, url, data, opts);
    }

}