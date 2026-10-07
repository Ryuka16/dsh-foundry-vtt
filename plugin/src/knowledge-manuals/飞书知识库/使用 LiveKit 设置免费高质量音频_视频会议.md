<title>使用 LiveKit 设置免费高质量音频/视频会议</title>

LiveKit 是一款功能强大且易于使用的视频会议平台，让您能够轻松创建高质量的音频和视频通话。 在本文中，我们将介绍如何设置一个免费服务器，以便与您的 Foundry VTT 游戏配合使用。

（译者注：测试了一下，确实可以用，LiveKit有一定免费额度，不过不保证在国内的访问效果）

# Setting up a LiveKit Server 设置 LiveKit 服务器

- 首先，您需要创建一个 LiveKit 账户。您可以通过访问 [LiveKit Cloud 网站](https://cloud.livekit.io/) 并按照说明进行操作来完成此步骤。
- 当您进入 `Create your first app` 屏幕时，为您的应用程序输入一个名称，然后点击 `Continue` 。请注意，您选择的名称无关紧要，但该名称不能包含 `livekit` 这个词。
- 回答调查问题并点击 `Continue` 。
- 您将看到一个初看可能令人困惑的界面，但我们只需关注其中特定部分。在左侧边栏中选择 `Settings`
- 选择屏幕顶部中央的 `API Keys` 标签页。
- 点击 `Add New Key`
- 提供描述，例如 `fvtt` 并确认。
- 现在您应该会看到一个密钥列表，暂时不要关闭此窗口。
- 复制 `WEBSOCKET URL` 、 `API KEY` 和 `SECRET KEY` 并将其存储在安全的地方。请注意，您将无法再次查看这些密钥。如果不小心关闭了窗口或丢失了密钥，您随时可以生成新的密钥。（译者注：LiveKit似乎更新了，反正我测试的时候可以多次看）

# 使用 Foundry VTT 设置 LiveKit 服务器

- 安装 [LiveKit AVClient](https://foundryvtt.com/packages/avclient-livekit) 模块。
- 进入你的世界并启用该模块
- 前往配置设置，然后配置音频/视频
- 选择服务器选项卡并输入先前复制的文本：

  - LiveKit Server -> Custom
  - LiveKit Server Adress -> `WEBSOCKET URL`
  - LiveKit API Key -> `API KEY`
  - LiveKit Secret Key -> `SECRET KEY`

**请注意，您需要粘贴实际的密钥，例如 `APIhhzG6SiGbjQZ` 而不是 `API KEY` 。**

## 开始音频/视频会议

恭喜您，您已成功设置 LiveKit 服务器！现在您应该能够与您的玩家开始音频/视频会议了。