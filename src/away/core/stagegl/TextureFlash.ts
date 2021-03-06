///<reference path="../../_definitions.ts"/>

module away.stagegl
{
	import ByteArrayBase					= away.utils.ByteArrayBase;

	export class TextureFlash extends ResourceBaseFlash implements ITexture
	{
		private _context:ContextStage3D;
		private _width:number;
		private _height:number;

		public get width():number
		{
			return this._width;
		}

		public get height():number
		{
			return this._height;
		}

		constructor(context:ContextStage3D, width:number, height:number, format:string, forRTT:boolean, streaming:boolean = false)
		{
			super();

			this._context = context;
			this._width = width;
			this._height = height;

			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.initTexture, (forRTT? away.stagegl.OpCodes.trueValue : away.stagegl.OpCodes.falseValue)) + width + "," + height + "," + streaming + "," + format + "$");
			this._pId = this._context.execute();
			this._context._iAddResource(this);
		}

		public dispose()
		{
			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.disposeTexture) + this._pId.toString() + ",");
			this._context.execute();
			this._context._iRemoveResource(this);

			this._context = null;
		}

		public uploadFromData(bitmapData:away.base.BitmapData, miplevel?:number);
		public uploadFromData(image:HTMLImageElement, miplevel?:number);
		public uploadFromData(data:any, miplevel:number = 0)
		{
			if (data instanceof away.base.BitmapData) {
				data = (<away.base.BitmapData> data).imageData.data;
			} else if (data instanceof HTMLImageElement) {
				var can = document.createElement("canvas");
				var w = data.width;
				var h = data.height;
				can.width = w;
				can.height = h;
				var ctx = can.getContext("2d");
				ctx.drawImage(data, 0, 0);
				data = ctx.getImageData(0, 0, w, h).data;
			}

			var pos = 0;
			var bytes = ByteArrayBase.internalGetBase64String(data.length, function () {
				return data[pos++];
			}, null);

			this._context.addStream(String.fromCharCode(away.stagegl.OpCodes.uploadBytesTexture) + this._pId + "," + miplevel + "," + (this._width >> miplevel) + "," + (this._height >> miplevel) + "," + bytes + "%");
			this._context.execute();
		}
	}
}