// pages/searchCar/searchCar.js
let app = getApp(),
  util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //筛选页总数据
    searchData:{},
    // 是否显示 sidebar
    sidebarListPop: false,
    //sidebar  遮罩层
    shadeShow: false,
    // sidebar 所有数据
    sidebarData: {},
    indexNav: [],
    //发送的数据
    getSearchData:{
      subCateId:'',
      brandId: '',
      paramId: '',
      order: '',
      page: 1,
    },
    soup: '',
    //是否出现result弹层
    searchResultPop:false,
    //暂时存放的存储车系信息
    seriesInfo: {},
    //筛选结果数据
    resultData: {},
    //查看选中的类别
    typeIndex: '',
    //查看选中的发送参数名称
    option: '',
    paramName:'',
    //paramId 存储器
    paramId: {},
    // 是否显示 sidebar
    // sidebarListPop: false,
    //sidebar  遮罩层
    // shadeShow: false,
    // sidebar 所有数据
    // sidebarData: {},
    //存储sidebar 列表的数量
    seriesListNumber: [],
    //发送的数据
    // getSearchData: {
    //   brandId: '',
    //   paramId: '',
    //   order: '',
    //   page: 1,
    // },
    //展开分类选项
    fold: false,
    // 品牌索引导航
    indicateShow: true,
    indicateText: '',
    activeIndex: '',
    navInfo: '',
    //正在加载列表
    loading: false,
    //禁止加载
    noMore:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //请求筛选页面数据
    wx.request({
      url: `${app.ajaxurl}/index.php?r=weex/index`,
      success:res => {
        if (res.errMsg === 'request:ok'){
          this.setData({
            searchData:res.data
          })
          // console.log(this.data.searchData)
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '条件选车'
    })
    // 跨页筛选
    const sprdScres = wx.getStorageSync('sprdScres')
    const getSearchData = this.data.getSearchData;
    if (sprdScres === 0 || sprdScres === 1 || sprdScres === 2) {
      switch (sprdScres) {
        case 0:
          getSearchData.subCateId = '123'
          this.setData({
            sidebarListPop: false,
            shadeShow: false,
            searchResultPop: true,
            getSearchData: getSearchData
          })
          //请求搜索结果数据
          this.getSearchData();
          break;
        case 1:
          getSearchData.subCateId = '124'
          this.setData({
            sidebarListPop: false,
            shadeShow: false,
            searchResultPop: true,
            getSearchData: getSearchData
          })
          //请求搜索结果数据
          this.getSearchData();
          break;
        default:
          getSearchData.subCateId = '66'
          getSearchData.paramId = '703'
          this.setData({
            sidebarListPop: false,
            shadeShow: false,
            getSearchData: getSearchData,
            searchResultPop: true,
            page: 1,
            noMore: false,
          })
          this.getSearchData();
          break;
      }
      wx.removeStorageSync('sprdScres')
    } else {
      if (!this.data.shadeShow && !this.data.sidebarListPop) {
        this.setData({
          searchResultPop: false
        })
      }
    }
  },
  more(event){
    let id = event.currentTarget.dataset.id;
    wx.request({
      url: `${app.ajaxurl}/index.php?r=weex/index/cate-sub&cate_id=${id}`,
      success:res => {
        if (res.errMsg === 'request:ok') {
          // console.log(res.data)
        }
      }
    })
    
  },
  // 点击品牌显示 sidebar
  moreType(e) {
    //显示sidebar和遮罩层
    this.setData({
      sidebarListPop: true,
      shadeShow: true
    })
    let id = e.currentTarget.dataset.id;
    wx.request({
      url: `${app.ajaxurl}/index.php?r=weex/index/cate-sub&cate_id=${id}`,
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          this.setData({
            sidebarData: res.data
          })
          // console.log(this.data.sidebarData)
        }
      }
    })
  },
  // 隐藏 sidebar
  sidebarListHide: function () {
    this.setData({
      sidebarListPop: false,
      shadeShow: false,
      soup: ''
    })
  },
  //点击筛选条件弹出筛选结果弹层
  goResult(e){
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name


    let getSearchData = this.data.getSearchData;

    for (let key in getSearchData){
      getSearchData[key] = ''
    }

    getSearchData[name] = id;

    // console.log(this.data.getSearchData,'this.data.getSearchData')

    //隐藏sidebar
    this.setData({
      sidebarListPop: false,
      shadeShow: false,
      getSearchData: getSearchData
    })

    // console.log(getSearchData)
    //弹出筛选结果弹层
    this.setData({
      searchResultPop:true,
    })
    
    //请求搜索结果数据
    this.getSearchData();
    


    // wx.setStorage({
    //   key: 'getSearchData',
    //   data: getSearchData,
    //   success:res => {
    //     wx.navigateTo({
    //       url: '../searchResult/searchResult',
    //     })
    //   }
    // })

  },

  //搜索结果页

    //请求搜索结果数据
  getSearchData(e) {
    //点击用途类别
    if (e && e.currentTarget.dataset.id) {
      //显示Loading
      this.showLoading()

      //查看是否有选中项
      let resultData = this.data.resultData
      let fold = false
      resultData.paramList.forEach((res, index) => {
        if (index > 5 && res.selName) {
          fold = true;
        }
      })

      let getSearchData = this.data.getSearchData
      getSearchData.subCateId = e.currentTarget.dataset.id

      this.setData({
        fold: fold,
        sidebarListPop: false,
        shadeShow: false,
        getSearchData: getSearchData
      })
      //请求初始数据
      this.getInitialData();
    } else {
      //获取发送subCatId

      let getSearchData = this.data.getSearchData

      // console.log(getSearchData, 'getSearchData')
      this.setData({
        getSearchData: getSearchData
      })
      //请求初始数据
      this.getInitialData();
    }
    //重置配置和允许滚动加载
    this.setData({
      page:1,
      noMore:false,
    })
  },
  //请求初始化数据
  getInitialData(obj) {
    //获取选择数据的缓存
    let objs = this.data.getSearchData
    if (obj) {
      objs = obj
    }
    wx.request({
      url: `${app.ajaxurl}/index.php?r=weex/list`,
      data: objs,
      success: ele => {
        //如果是滚动加载
        if(this.data.loading){
          let resultData = this.data.resultData;

          resultData.seriesList = resultData.seriesList.concat(ele.data.seriesList)
          resultData.productList = resultData.productList.concat(ele.data.productList)

          this.setData({
            resultData: resultData,
            loading:false,
          })
          if (this.data.getSearchData.page == ele.data.pageTotal){
            this.setData({
              noMore:true,
            })
          }
        }else{
          //如果有类别选项
          if (ele.data.paramList.length) {
            let number = 0;
            ele.data.paramList.forEach((el, index) => {
              if (el.fId == '7') {
                number++;
              }
            })

            //添加品牌分类
            let brand = {
              name: '品牌',
              fId: '',
              option: 'brandId'
            }
            //如果选择品牌进入页面，默认品牌为选中
            if (ele.data.brandId) {
              //修改选择分类的值。
              brand.selected = ele.data.brandId
              brand.selName = ele.data.brandName
            }
            ele.data.paramList.splice(number, 0, brand)

            //如果选择价格，进入页面默认选中价格
            // console.log(ele.data)

            //如果没有子类，添加子类分类
            if (!this.data.getSearchData.subCateId) {
              let subCate = {
                name: '用途类别',
                fId: '',
                option: 'subCateId'
              }
              ele.data.paramList.unshift(subCate)
            }
          }


          let paramId = this.data.paramId;
          for(let index = 0;index < ele.data.paramList.length;index++){
            if (ele.data.paramList[index].selName){
              paramId[ele.data.paramList[index].name] = this.data.getSearchData.paramId
            }
          }

          //给数据赋值
          this.setData({
            paramId: paramId,
            resultData: ele.data
          })
          // 标题
          wx.setNavigationBarTitle({
            title: ele.data.h1
          })

          //关闭Loading
          this.hideLoading()
        }
      }
    })
  },
  // 请求sidebar内容 && 显示sidebar
  sidebarShow(e) {
    // console.log(this.data.getSearchData,'this.data.getSearchData')
    //显示sidebar和遮罩层
    this.setData({
      sidebarListPop: true,
      shadeShow: true,
      sidebarData: {}
    })
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    let index = e.currentTarget.dataset.index
    let option = e.currentTarget.dataset.option
    let typeName = e.currentTarget.dataset.typename
    let getSearchData = this.data.getSearchData

    if (name != 'brandId' || getSearchData.brandId === '') {
      getSearchData[name] = id;
    }

    this.setData({
      getSearchData: getSearchData,
      typeIndex: index,
      option: option,
      typeName: typeName
    })

    // console.log(typeName, 'name')

    //请求品牌弹层列表
    if (name == 'brandId') {
      wx.request({
        url: `${app.ajaxurl}/index.php?r=weex/list/brand-filter`,
        data: this.data.getSearchData,
        success: res => {
          if (res.errMsg == 'request:ok') {
            // 添加标题
            res.data.params = {
              name: '品牌'
            }
            let unlimited = [{
              id: '',
              name: '不限',
              unlimited: true,
            }];
            res.data.letters.unshift('top')
            res.data.brandList.unshift(unlimited)

            // console.log(res.data, 'res.data')

            this.setData({
              sidebarData: res.data,
              indexNav: res.data.letters
            })
          }
        }
      })
    } else if (name == 'subCateId') {
      //请求用途类别列表
      wx.request({
        url: `${app.ajaxurl}/index.php?r=weex/list/cate`,
        data: this.data.getSearchData,
        success: res => {
          // console.log(res.data, 'subCateId')
          let unlimited = {
            'id': '',
            'name': '不限',
            'is_disable': 0
          };
          let has = 1;
          res.data.forEach(ele => {
            if (ele.selected) {
              has = 0;
            }
          })

          unlimited['selected'] = has;

          res.data.unshift(unlimited)

          this.setData({
            sidebarData: res.data,
          })
        }
      })

    } else {
      //请求其他子类数据
      wx.request({
        url: `${app.ajaxurl}/index.php?r=weex/list/param-filter`,//&subCateId=${''}&fid=${id}&paramId=${''}&brandId=${''}`,
        data: this.data.getSearchData,
        success: res => {
          if (res.errMsg == 'request:ok') {
            let unlimited = {
              'id': '',
              'name': '不限',
              'is_disable': 0
            };
            let has = 1;
            res.data.params.list.forEach(ele => {
              if (ele.selected) {
                has = 0;
              }
            })

            unlimited['selected'] = has;

            res.data.params.list.unshift(unlimited)

            this.setData({
              sidebarData: res.data,
            })
          }
        }
      })
    }
    //请求子类车系
    // wx.request({
    //   url: `${app.ajaxurl}/index.php?r=weex/list/cate&brandId=${this.brandId}&paramId=${id}`,
    //   success: (res) => {
    //     if (res.errMsg == 'request:ok') {
    //       this.setData({
    //         sidebarData: res.data,
    //       })
    //       console.log(this.data.sidebarData)
    //     }
    //   }
    // })
  },
  //点击 sidebar
  clickSidebar(e) {
    //查看按钮是否是禁用状态
    let disable = e.currentTarget.dataset.disable;
    // console.log(disable)
    if (disable) {
      return
    }

    //显示Loading
    this.showLoading()

    //获取点击的id
    let id = e.currentTarget.dataset.id


    // console.log(id,'wocao')
    //存储 paramId
    let paramId = this.data.paramId
    //增加选择框高亮显示
    let resultData = this.data.resultData;
    //点击的名字
    let name = e.currentTarget.dataset.name
    //发送参数的值
    let getSearchData = this.data.getSearchData
    getSearchData.order = ''
    //重置page
    getSearchData.page = 1;

    //封装 paramId 参数
    if (this.data.option === 'paramId') {
      paramId[this.data.typeName] = id;
      //暂时存储 paramId
      let arr = []
      
      for (let key in paramId){
        if (paramId[key]){
          arr.push(paramId[key])
        }
      }

      //存储 paramId 的值
      getSearchData[this.data.option] = arr.join('-')

      // console.log(getSearchData[this.data.option],'getSearchData[this.data.option]getSearchData[this.data.option]')

    } else if (this.data.option === 'brandId') {
      //存储brandId的值
      getSearchData[this.data.option] = id;
    }

    //如果选择品牌的不限，那么选项显示品牌
    if (name == '不限') {
      name = ''
    }
    // console.log(name)

    //修改选择分类的值。
    resultData.paramList[this.data.typeIndex].selected = id
    resultData.paramList[this.data.typeIndex].selName = name

    // console.log(this.data.getSearchData, 'this.data')

    this.setData({
      //增加列别选项的高亮显示
      resultData: resultData,
      //存储发送的存储对象
      getSearchData: getSearchData,
      //存储paramId
      paramId: paramId,
      //隐藏sidebar
      sidebarListPop: false,
      shadeShow: false,
      //允许滚动加载
      noMore:false,
    })
    this.searchResult(res => {
      // console.log(res.data)
      //改变列表的值
      let resultData = this.data.resultData;
      resultData.total = res.data.total;
      resultData.seriesList = res.data.seriesList;
      resultData.productList = res.data.productList;

      //改变标题名称
      wx.setNavigationBarTitle({
        title: res.data.h1
      })

      //重新赋值
      this.setData({
        resultData: resultData
      })

      //关闭Loading
      this.hideLoading()
    })
  },
  //点击热度和价格
  selectOrder(e) {

    let getSearchData = this.data.getSearchData
    let order = e.currentTarget.dataset.order
    //如果点击的是一样的，那么return掉
    if (getSearchData.order == order) {
      return
    }

    //显示Loading
    this.showLoading()

    getSearchData.order = order
    //重置page
    getSearchData.page = 1;
    this.setData({
      getSearchData: getSearchData,
      //允许滚动加载
      noMore:false,
    })

    this.searchResult(res => {
      //改变列表的值
      let resultData = this.data.resultData;
      resultData.total = res.data.total;
      resultData.seriesList = res.data.seriesList;
      resultData.productList = res.data.productList;
      //改变标题名称
      wx.setNavigationBarTitle({
        title: res.data.h1
      })

      //重新赋值
      this.setData({
        resultData: resultData
      })
      //关闭Loading
      this.hideLoading()
    })
  },
  //搜索结果
  searchResult(callback) {
    wx.request({
      url: `${app.ajaxurl}/index.php?r=weex/list&isList=1`,
      data: this.data.getSearchData,
      success: res => {
        callback(res)
      }
    })
  },
  //点击车系列表
  clickSeriesList(e) {
    // console.log(this.data.getSearchData,'w cao cao ',1)
    let id = e.currentTarget.dataset.id
    let subId = e.currentTarget.dataset.subid

    //存储车系内容
    let seriesInfo = {
      'F_SubCategoryId': subId,
      'F_SeriesId': id
    };
    this.setData({
      seriesInfo: seriesInfo
    })
    wx.setStorage({
      key: 'seriesInfo',
      data: seriesInfo,
    })

    // console.log(this.data.getSearchData)

    //显示sidebar和遮罩层
    this.setData({
      //显示sidebar
      sidebarListPop: true,
      shadeShow: true,
      //置空sidebar数据内容
      sidebarData: {},
      //置空车系弹层数量
      seriesListNumber: [],
    })

    //请求车系弹层列表
    wx.request({
      url: `${app.ajaxurl}/index.php?r=weex/list/product&subId=${subId}&seriesId=${id}&paramId=${this.data.getSearchData.paramId || ''}&brandId=${this.data.getSearchData.brandId || ''}&order=''`,
      success: res => {
        //改变sidebar的值并且显示sidebar
        this.setData({
          sidebarData: res.data
        })
      }
    })
  },
  // 按马力筛选车型
  selectSoup(e){
    let id = e.currentTarget.dataset.id
    let subId = e.currentTarget.dataset.subid
    let soups = e.currentTarget.dataset.order
    if (this.data.soup !== '') {
      if (this.data.soup == 4) {
        this.setData({
          soup: 3
        })
      } else {
        this.setData({
          soup: 4
        })
      }
    } else {
      this.setData({
        soup: soups
      })
    }
    //请求车系弹层列表
    wx.request({
      url: `${app.ajaxurl}/index.php?r=weex/list/product&subId=${subId}&seriesId=${id}&paramId=${this.data.getSearchData.paramId || ''}&brandId=${this.data.getSearchData.brandId || ''}&order=${this.data.soup}`,
      success: res => {
        //改变sidebar的值并且显示sidebar
        this.setData({
          sidebarData: res.data
        })
      }
    })
  },
  //进入车系页
  goSeries() {
    wx.navigateTo({
      url: '../series/series'
    })
  },
  //进入车型页
  goModel(e) {
    let productData = this.data.seriesInfo
    let subCateId = e.currentTarget.dataset.subcateid
    let seriesId = e.currentTarget.dataset.seriesid

    productData.F_ProductId = e.currentTarget.dataset.id

    //点击车型列表，直接进入车型页面
    if (subCateId) {
      productData.F_SubCategoryId = subCateId
      productData.F_SeriesId = seriesId
      wx.setStorage({
        key: 'seriesInfo',
        data: productData,
      })
    }

    wx.setStorage({
      key: 'productData',
      data: productData,
      success: () => {
        wx.navigateTo({
          url: '../model/model'
        })
      }
    })
  },
  //进入询底价页
  goFooterPrice(e) {
    wx.setStorage({
      key: 'priceProductId',
      data: e.currentTarget.dataset.id,
      success: () => {
        wx.navigateTo({
          url: '../footerPrice/footerPrice'
        })
      }
    })
  },
  fold(e) {
    this.setData({
      fold: !this.data.fold
    })
  },
  //点击显示更多车系弹层列表
  loadMore(e) {
    let index = e.currentTarget.dataset.index
    let seriesListNumber = this.data.seriesListNumber
    if (seriesListNumber[index]) {
      seriesListNumber[index] += 5;
    } else {
      seriesListNumber[index] = 10;
    }
    this.setData({
      seriesListNumber: seriesListNumber
    })
  },
  // 点击索引导航
  indexNav(e, info) {
    let index = e.target.dataset.index;
    this.setData({
      activeIndex: index,
      indicateShow: false,
      navInfo: index,
    })
    let time = setTimeout(() => {
      this.setData({
        indicateShow: true,
      })
      clearTimeout(time)
    }, 500)

    // console.log(this.data.navInfo)
  },
  //导航栏
  indexNavmove(e) {
    console.log(e)
    let num = e.target.dataset.number;
    let top = e.target.offsetTop;
    let index = this.data.indexNav[Math.floor((e.changedTouches[0].pageY - e.currentTarget.offsetTop) / (top / num))];

    if (index === this.data.activeIndex) {
      return
    }

    this.setData({
      activeIndex: index,
      indicateShow: false,
      scrollAnimation: false,
      navInfo: index,
    })
  },
  indexNavEnd(e) {
    let time = setTimeout(() => {
      this.setData({
        indicateShow: true,
        scrollAnimation: true,
      })
      clearTimeout(time)
    }, 500)
  },
  //点击返回筛选页
  searchResultBack(){
    this.setData({
      searchResultPop:false,
    })
    let time = setTimeout(() => {
      this.setData({
        resultData: {},
        fold:false,
      })
      clearTimeout(time)
    },300)
    wx.setNavigationBarTitle({
      title: '条件选车'
    })
  },
  //滚动加载更多
  loadData(){
    //如果正在加载，直接return
    if (this.data.noMore || this.data.loading){
      return
    }
    let getSearchData = this.data.getSearchData
    getSearchData.page ++
    // console.log(getSearchData)
    this.setData({
      loading:true,
      getSearchData: getSearchData
    })
    // console.log(this.data.loading)
    //请求加载数据
    this.getInitialData()
  },

  showLoading: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 3000
    });
  },
  hideLoading: function () {
    wx.hideToast();
  },
})
